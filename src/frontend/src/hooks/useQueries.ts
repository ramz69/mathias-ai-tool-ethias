import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Message, Policy, FamilyMember, Guarantee } from "../backend.d";

export function useChatMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["chatMessages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendMessage(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
    },
  });
}

export function useInitializePolicy() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (numero: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.initializePolicy(numero);
    },
  });
}

export function usePolicyDetails(policyNumber: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Policy | null>({
    queryKey: ["policy", policyNumber],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPolicyDetails(policyNumber);
    },
    enabled: !!actor && !isFetching && !!policyNumber,
  });
}

export function useFamilyMembers(policyNumber: string) {
  const { actor, isFetching } = useActor();
  return useQuery<FamilyMember[]>({
    queryKey: ["family", policyNumber],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFamilyMembers(policyNumber);
    },
    enabled: !!actor && !isFetching && !!policyNumber,
  });
}

export function useGuarantees(policyNumber: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Guarantee[]>({
    queryKey: ["guarantees", policyNumber],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGuarantees(policyNumber);
    },
    enabled: !!actor && !isFetching && !!policyNumber,
  });
}
