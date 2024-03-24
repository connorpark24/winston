import { useState } from "react";
import { useDropzone } from "react-dropzone";

type Question = {
  question: string;
  choices: string[];
  answer: string;
};

function App() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "application/pdf",
    onDrop: (acceptedFiles) => {
      setPdf(acceptedFiles[0]);
    },
  });

  const handleSubmit = async () => {
    if (pdf) {
      const formData = new FormData();
      formData.append("file", pdf);

      try {
        const response = await fetch("http://127.0.0.1:5000/process-pdf", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
          console.log(data);
          setSelectedAnswers(Array(data.length).fill(""));
        } else {
          console.error("Failed to upload PDF");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[index] = answer;
    setSelectedAnswers(newSelectedAnswers);
  };

  return (
    <div className="w-screen flex flex-col items-center justify-center p-16">
      <div className="bg-white shadow-md border-[1px] rounded-lg w-1/2 p-4">
        <h1 className="text-xl font-bold text-center mb-4">Upload your PDF</h1>
        <div
          {...getRootProps()}
          className="border-2 border-dashed p-4 text-center cursor-pointer mb-4"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the PDF here...</p>
          ) : (
            <p>Drag 'n' drop a PDF here, or click to select a file</p>
          )}
        </div>
        {pdf && <p className="mt-4">Selected PDF: {pdf.name}</p>}
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
      {questions && (
        <div className="w-1/2 mt-8">
          {questions.map((question, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-xl mb-4">
              <p className="font-semibold">Question {index + 1}:</p>
              <p>{question.question}</p>
              <div>
                <div className="mt-2">
                  {question.choices.map((choice, choiceIndex) => (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
