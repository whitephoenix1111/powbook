"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Redirect legacy /reader/[id] → /book/[id] */
export default function ReaderRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/book/${id}`);
  }, [id, router]);
  return null;
}
