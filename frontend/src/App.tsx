import { useState } from "react";
import { useDropzone } from "react-dropzone";

function App() {
  const [pdf, setPdf] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "application/pdf",
    onDrop: (acceptedFiles) => {
      setPdf(acceptedFiles[0]);
    },
  });

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="bg-white shadow-md border-[1px] rounded-lg h-1/2 w-1/2 mx-auto p-4">
        <h1 className="text-xl font-bold text-center mb-4">Upload your PDF</h1>
        <div
          {...getRootProps()}
          className="border-2 border-dashed p-4 text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the PDF here...</p>
          ) : (
            <p>Drag 'n' drop a PDF here, or click to select a file</p>
          )}
        </div>
        {pdf && <p className="mt-4">Selected PDF: {pdf.name}</p>}
      </div>
    </div>
  );
}

export default App;
