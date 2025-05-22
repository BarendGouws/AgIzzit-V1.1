// pages/manage/advertising-template/[id].js
import dynamic from 'next/dynamic';

const TemplateDesigner = dynamic(() => import('@/components/advertising/TemplateDesigner'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const AdvertisingTemplatePage = () => {
    return (
      <div className="container-fluid">
        <TemplateDesigner />
      </div>
    );
  }

AdvertisingTemplatePage.layout = "ManageLayout"

export default AdvertisingTemplatePage