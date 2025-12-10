module.exports = {
	apps: [
		{
			name: 'punto-infissi-crm-current',
			script: 'npm',
			args: 'start -- --port 3000',
			cwd: '/var/www/fastuser/data/www/infissi.omoxsoft.com.ua',
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			max_restarts: 10,
			min_uptime: '10s',
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production',
			},
			error_file: '/var/www/fastuser/data/logs/punto-infissi-crm-error.log',
			out_file: '/var/www/fastuser/data/logs/punto-infissi-crm-out.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			merge_logs: true,
			watch: false,
		},
	],
}

