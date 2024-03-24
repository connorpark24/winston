import { useState } from "react";
import { useDropzone } from "react-dropzone";

type MCQuestion = {
  question: string;
  choices: string[];
  answer: string;
  type: string;
};

type TFQuestion = {
  question: string;
  answer: string;
  type: string;
};

type OEQuestion = {
  question: string;
  answer: string;
  type: string;
};

type Question = MCQuestion | TFQuestion | OEQuestion;

function App() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questionType, setQuestionType] = useState<string>("multiple-choice");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [similarityScores, setSimilarityScores] = useState<number[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "application/pdf",
    onDrop: (acceptedFiles) => {
      setPdf(acceptedFiles[0]);
    },
  });

  const handleSubmit = async () => {
    if (!pdf) {
      setErrorMessage("Please select a PDF file before generating questions.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    const formData = new FormData();
    formData.append("file", pdf);

    try {
      const response = await fetch(`http://127.0.0.1:5000/${questionType}`, {
        method: "POST",
        body: formData,
      });
      setIsLoading(false);
      if (response.ok) {
        const data = await response.json();
        const typedData = data.map((question: Question) => ({
          ...question,
          type: questionType,
        }));
        setQuestions(typedData);
        setSelectedAnswers(Array(data.length).fill(""));
        setIsSubmitted(false);
      } else {
        console.error("Failed to upload PDF");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error:", error);
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[index] = answer;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleQuizSubmit = async () => {
    setIsSubmitted(true);

    const openEndedQuestions = questions.filter((q) => q.type === "open-ended");
    const responses = openEndedQuestions.map(
      (_, index) => selectedAnswers[index]
    );
    const answers = openEndedQuestions.map((q) => q.answer);

    const response = await fetch("http://127.0.0.1:5000/check-similarity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ responses, answers }),
    });

    const { similarities } = await response.json();
    const updatedSimilarityScores = questions.map(
      (question) =>
        question.type === "open-ended"
          ? similarities[openEndedQuestions.indexOf(question)]
          : -1 // Use -1 to indicate non-open-ended questions
    );

    setSimilarityScores(updatedSimilarityScores);
  };

  const getBackgroundColorClass = (question: Question, index: number) => {
    if (!isSubmitted) return "bg-gray-100";

    if (question.type === "open-ended") {
      const score = similarityScores[index];
      return score >= 0.6
        ? "bg-green-200"
        : score >= 0.4
        ? "bg-yellow-200"
        : "bg-red-200";
    } else {
      return selectedAnswers[index] === question.answer
        ? "bg-green-100"
        : "bg-red-100";
    }
  };

  return (
    <div className="w-screen flex flex-col items-center justify-center p-16">
      <div className="bg-white border-[1px] rounded-lg w-1/2 p-8 items-center flex flex-col gap-y-4">
        <h1 className="text-3xl font-bold text-center mb-4">HooHacks 24</h1>

        <div
          {...getRootProps()}
          className="border-[1px] p-4 h-24 text-center cursor-pointer mb-4 w-full flex items-center justify-center rounded-lg"
        >
          <input {...getInputProps()} />
          <p className="text-gray-400 ">Select a PDF</p>
        </div>

        <div className="flex gap-x-2 mb-4">
          <button
            className={`${
              questionType === "multiple-choice"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            } font-bold py-2 px-4 rounded-md`}
            onClick={() => setQuestionType("multiple-choice")}
          >
            Multiple Choice
          </button>
          <button
            className={`${
              questionType === "open-ended"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            } font-bold py-2 px-4 rounded-md`}
            onClick={() => setQuestionType("open-ended")}
          >
            Open-Ended
          </button>
          <button
            className={`${
              questionType === "true-false"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            } font-bold py-2 px-4 rounded-md`}
            onClick={() => setQuestionType("true-false")}
          >
            True/False
          </button>
        </div>
        {pdf && <p className="">{pdf.name}</p>}
        {errorMessage && (
          <div className="text-red-500 text-center mb-4">{errorMessage}</div>
        )}
        <button
          className={`${
            isLoading ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-400"
          } text-white font-bold py-2 px-8 rounded-md`}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Generate Questions"}
        </button>
      </div>
      {questions.map((question, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl my-4 w-2/3 ${getBackgroundColorClass(
            question,
            index
          )}`}
        >
          <p className="font-semibold">Question {index + 1}:</p>
          <p>{question.question}</p>
          <div>
            <div className="mt-2">
              {question.type === "multiple-choice" &&
                question.choices.map((choice: string, choiceIndex: number) => (
                  <label key={choiceIndex} className="block">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={choice}
                      checked={selectedAnswers[index] === choice}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      className="mr-2"
                    />
                    {choice}
                  </label>
                ))}
              {question.type === "open-ended" && (
                <div
                  className={`${
                    isSubmitted
                      ? similarityScores[index] >= 0.8
                        ? "bg-green-200"
                        : similarityScores[index] >= 0.5
                        ? "bg-yellow-200"
                        : "bg-red-200"
                      : ""
                  }`}
                >
                  <input
                    type="text"
                    value={selectedAnswers[index]}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-full p-1.5 text-sm mt-1 rounded-md"
                    placeholder="Enter your answer"
                    disabled={isSubmitted}
                  />
                </div>
              )}

              {question.type === "true-false" && (
                <>
                  <label className="block">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value="True"
                      checked={selectedAnswers[index] === "True"}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      className="mr-2"
                    />
                    True
                  </label>
                  <label className="block">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value="False"
                      checked={selectedAnswers[index] === "False"}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      className="mr-2"
                    />
                    False
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      <button
        className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-8 rounded-md mt-4"
        onClick={handleQuizSubmit}
      >
        Submit Quiz
      </button>
    </div>
  );
}

export default App;
