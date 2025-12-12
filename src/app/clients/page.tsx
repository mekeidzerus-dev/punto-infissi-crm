'use client'

import ClientsStickerV2 from '@/components/clients-sticker-v2'
import { useEffect } from 'react'

export default function ClientsPage() {
	// #region agent log
	useEffect(() => {
		fetch('http://127.0.0.1:7242/ingest/218ca7f0-e3d7-4389-a1b6-4602048211d4', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				location: 'clients/page.tsx:7',
				message: 'ClientsPage component mounted',
				data: {},
				timestamp: Date.now(),
				sessionId: 'debug-session',
				runId: 'run1',
				hypothesisId: 'C',
			}),
		}).catch(() => {})
	}, [])
	// #endregion

	return <ClientsStickerV2 />
}
