
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganization } from "@/redux/manage/slices/organization";

export default function StateLoader({ status }) {

  const dispatch  = useDispatch();

  const org = useSelector(state => state.organization.organization);

  useEffect(() => {
        if (status === 'authenticated' && !org) dispatch(fetchOrganization());
      }, [status, org, dispatch]);  

  return null;   // renders nothing – just does the work
}
