export default function Loading({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-dark-700 border-t-red-600 rounded-full animate-spin"></div>
        <p className="text-dark-400 text-center px-4 max-w-md">{message}</p>
      </div>
    </div>
  );
}
