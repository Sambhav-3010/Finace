"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchChatSessions } from "@/store/slices/chatSessionsSlice";

/** Loads chat recents once per login. No polling. */
export function ChatSessionsHydrator() {
  const dispatch = useAppDispatch();
  const authReady = useAppSelector((s) => s.auth.authReady);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const loaded = useAppSelector((s) => s.chatSessions.loaded);

  useEffect(() => {
    if (authReady && isAuthenticated && !loaded) {
      dispatch(fetchChatSessions());
    }
  }, [authReady, isAuthenticated, loaded, dispatch]);

  return null;
}
