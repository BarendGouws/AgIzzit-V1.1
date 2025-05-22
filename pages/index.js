import dynamic from 'next/dynamic';

// Dynamically import the CanvasPDFViewer component
const CanvasPDFViewer = dynamic(() => import('../components/signature/CanvasPDFEditor'), {
  ssr: false, // Ensure it's only rendered on the client side
});

const Home = () => {

  return (
    <>
      <h1>PDF.js Example in Next.js</h1>
        <CanvasPDFViewer />
    </>
  );
};

export default Home;