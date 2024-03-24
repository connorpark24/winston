import { useState } from "react";
import { useDropzone } from "react-dropzone";

type MCQuestion = {
  question: string;
  choices: string[];
  answer: string;
};

type TFQuestion = {
  question: string;
  answer: string;
};

type BlankQuestion = {
  question: string;
  answer: string;
};

type Question = MCQuestion | TFQuestion | BlankQuestion;

function App() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questionType, setQuestionType] = useState<string>("multiple-choice");

  const { getRootProps, getInputProps } = useDropzone({
    accept: "application/pdf",
    onDrop: (acceptedFiles) => {
      setPdf(acceptedFiles[0]);
    },
  });

  const handleSubmit = async () => {
    if (pdf) {
      setIsLoading(true);
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
          // Add questionType to each question in the data
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
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[index] = answer;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleQuizSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <div className="w-screen flex flex-col items-center justify-center p-16">
      <h1 className="text-3xl font-bold text-center mb-4">HooHacks 24</h1>

      <div className="bg-white shadow-md border-[1px] rounded-lg w-1/2 p-4 items-center flex flex-col gap-y-4">
        <div
          {...getRootProps()}
          className="border-[1px] p-4 h-24 text-center cursor-pointer mb-4 w-full flex items-center justify-center rounded-lg"
        >
          <input {...getInputProps()} />
          <p className="text-gray-400 ">Select a PDF</p>
        </div>
        {pdf && <p className="">{pdf.name}</p>}
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
              questionType === "fill-in-the-blank"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            } font-bold py-2 px-4 rounded-md`}
            onClick={() => setQuestionType("fill-in-the-blank")}
          >
            Fill in the Blank
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
          className={`p-4 rounded-xl my-4 w-2/3 ${
            isSubmitted
              ? selectedAnswers[index] === question.answer
                ? "bg-green-100"
                : "bg-red-100"
              : "bg-gray-100"
          }`}
        >
          <p className="font-semibold">Question {index + 1}:</p>
          <p>{question.question}</p>
          <div>
            <div className="mt-2">
              {question.type === "multiple-choice" &&
                question.choices.map((choice, choiceIndex) => (
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
              {question.type === "fill-in-the-blank" && (
                <input
                  type="text"
                  value={selectedAnswers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="border-[1px] p-2 rounded-md"
                />
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
    </div>
  );
}

export default App;
