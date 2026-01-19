'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MatchModal } from '@/app/components/modals/MatchModal';
// import { pusherClient } from '@/src/infrastructure/realtime/pusher-client';

interface MatchData {
    isOpen: boolean;
    partnerName: string;
    partnerImage?: string;
    proposalId?: string;
}

interface MatchContextType {
    showMatch: (data: { partnerName: string; partnerImage?: string; proposalId?: string }) => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [matchData, setMatchData] = useState<MatchData>({
        isOpen: false,
        partnerName: '',
    });

    const showMatch = (data: { partnerName: string; partnerImage?: string; proposalId?: string }) => {
        setMatchData({
            isOpen: true,
            ...data
        });
    };

    const closeMatch = () => {
        setMatchData(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        // Real-time matches disabled (Don't use Pusher)
        /*
        if (!session?.user?.id || !pusherClient) return;

        const channelName = `user-${session.user.id}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind('proposal-accepted', (data: any) => {
            console.log('🎉 Match Event Received:', data);
            showMatch({
                partnerName: data.partnerName,
                partnerImage: data.partnerImage,
                proposalId: data.proposalId
            });
        });

        return () => {
            if (pusherClient) {
                pusherClient.unsubscribe(channelName);
            }
        };
        */
    }, [session?.user?.id]);

    return (
        <MatchContext.Provider value={{ showMatch }}>
            {children}
            <MatchModal
                isOpen={matchData.isOpen}
                onClose={closeMatch}
                partnerName={matchData.partnerName}
                partnerImage={matchData.partnerImage}
                myImage={session?.user?.image || undefined}
            />
        </MatchContext.Provider>
    );
}

export function useMatch() {
    const context = useContext(MatchContext);
    if (!context) {
        throw new Error('useMatch must be used within a MatchProvider');
    }
    return context;
}
