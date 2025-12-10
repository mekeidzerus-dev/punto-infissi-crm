module.exports = {
	apps: [
		{
			name: 'punto-infissi-crm-current',
			script: 'npm',
			args: 'start -- --port 3000',
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			max_restarts: 10,
			min_uptime: '10s',
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production',
			},
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			merge_logs: true,
			watch: false,
		},
	],
}

