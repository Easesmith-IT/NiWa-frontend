import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAICalls, fetchAICallingNumbers, saveAICallingNumber, startAICall } from "./ai-calling.api";

export const aiCallingKeys = {
  all: ["ai-calling"] as const,
  calls: () => [...aiCallingKeys.all, "calls"] as const,
  numbers: () => [...aiCallingKeys.all, "numbers"] as const,
};

export const useAICallingCalls = () =>
  useQuery({ queryKey: aiCallingKeys.calls(), queryFn: fetchAICalls, refetchInterval: 5000 });

export const useAICallingNumbers = () =>
  useQuery({ queryKey: aiCallingKeys.numbers(), queryFn: fetchAICallingNumbers });

export const useSaveAICallingNumber = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveAICallingNumber,
    onSuccess: () => client.invalidateQueries({ queryKey: aiCallingKeys.numbers() }),
  });
};

export const useStartAICall = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: startAICall,
    onSuccess: () => client.invalidateQueries({ queryKey: aiCallingKeys.calls() }),
  });
};
