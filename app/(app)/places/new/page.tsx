"use client";

import { useRouter } from "next/navigation";
import { NewPlaceForm } from "../_components/NewPlaceForm";

export default function NewPlacePage() {
  const router = useRouter();

  return (
    <NewPlaceForm
      onCreated={(place) => router.push(`/places/${place.id}`)}
      onCancel={() => router.push("/places")}
    />
  );
}
