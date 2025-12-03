import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BeingState, createInitialState } from '@/consciousness/state';

export const useBeingStatePersistence = (userId: string | undefined) => {
  const [beingState, setBeingState] = useState<BeingState>(createInitialState());
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  // Load being state on mount
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadBeingState = async () => {
      try {
        const { data, error } = await supabase
          .from('being_state')
          .select('k, v, a, h, i, c, u')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading being state:', error);
        }

        if (data) {
          setBeingState({
            K: data.k,
            V: data.v,
            A: data.a,
            H: data.h,
            I: data.i,
            C: data.c,
            U: data.u,
          });
        }
      } catch (err) {
        console.error('Failed to load being state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBeingState();
  }, [userId]);

  // Save being state (debounced)
  const saveBeingState = useCallback(async (state: BeingState) => {
    if (!userId) return;

    const stateKey = JSON.stringify(state);
    if (stateKey === lastSavedRef.current) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves to avoid too many DB calls
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('being_state')
          .upsert({
            user_id: userId,
            k: state.K,
            v: state.V,
            a: state.A,
            h: state.H,
            i: state.I,
            c: state.C,
            u: state.U,
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('Error saving being state:', error);
        } else {
          lastSavedRef.current = stateKey;
        }
      } catch (err) {
        console.error('Failed to save being state:', err);
      }
    }, 2000); // Save after 2 seconds of no changes
  }, [userId]);

  // Update state and trigger save (supports functional updates)
  const updateBeingState = useCallback((newStateOrUpdater: BeingState | ((prev: BeingState) => BeingState)) => {
    setBeingState(prev => {
      const newState = typeof newStateOrUpdater === 'function' 
        ? newStateOrUpdater(prev) 
        : newStateOrUpdater;
      saveBeingState(newState);
      return newState;
    });
  }, [saveBeingState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    beingState,
    setBeingState: updateBeingState,
    isLoading,
  };
};
