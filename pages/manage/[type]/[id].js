import React from "react";
import { Alert } from "react-bootstrap";
import { useRouter } from "next/router";
import DealershipInventory from '@/components/manage/inventory/DealershipInventory'
import PropertyInventory from "@/components/manage/inventory/PropertyInventory";
import GoodsInventory from "@/components/manage/inventory/GoodsInventory";
import RentalsInventory from "@/components/manage/inventory/RentalsInventory";
import AccomodationInventory from "@/components/manage/inventory/AccomodationInventory";

const InventoryItem = ({}) => { 

  const router = useRouter();

  const { id, type } = router.query;

  //CURRENTLY USING TYPE TO DETERMINE WHICH COMPONENT TO RENDER RETHINK HERE, 
  // HOWEVER LOAD FAST THAT TYPE IS IN URL, AND NOT SHOWING VALID TYPE ERROR

  return (
    <> 
      {type === "inventory" ? (
        <DealershipInventory id={id} type={type} router={router}/>
      ) : type === "property" ? (
        <PropertyInventory id={id} type={type} router={router}/>
      ) : type === "goods" ? (
        <GoodsInventory id={id} type={type} router={router}/>
      ) : type === "rentals" ? (
        <RentalsInventory id={id} type={type} router={router}/>
      ) : type === "accomodation" ? (
        <AccomodationInventory id={id} type={type} router={router}/>
      ) : (
        <Alert variant="info">Please select a valid type</Alert>
      )}
    </>
  );
};

InventoryItem.layout = "ManageLayout";

export default InventoryItem;
