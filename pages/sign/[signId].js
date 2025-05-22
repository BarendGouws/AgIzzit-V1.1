import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const CanvasPDFSign = dynamic(() => import('@/components/signature/CanvasPDFSign'), { ssr: false });

const Sign = () => {

    const router = useRouter();
    const { signId } = router.query;  

	return (
		<CanvasPDFSign signId={signId} />   
	);
};

Sign.layout = "AgIzzitLayout";

export default Sign;