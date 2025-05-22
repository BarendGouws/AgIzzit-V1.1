import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const CanvasPDFEditor = dynamic(() => import('@/components/signature/CanvasPDFEditor'), { ssr: false });

const TemplateEdit = () => {

    const router = useRouter();
    const { docId } = router.query;  

	return (
		<CanvasPDFEditor docId={docId} />   
	);
};

TemplateEdit.layout = "AgIzzitLayout";

export default TemplateEdit;