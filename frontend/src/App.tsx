import { useState } from "react";
import { useDropzone } from "react-dropzone";

type Question = {
  question: string;
  answers: string[];
};

function App() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

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
        } else {
          console.error("Failed to upload PDF");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
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
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
      {questions && ( // Only render if questions array is not empty
        <div className="w-1/2 mt-8">
          {questions.map((question, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="font-semibold">Question {index + 1}:</p>
              <p>{question.question}</p>
              {question.answers.map((answer, answerIndex) => (
                <p key={answerIndex}>{answer}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
