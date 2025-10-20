module.exports = {
	apps: [
		{
			name: 'punto-infissi-crm-staging',
			script: 'npm',
			args: 'start -- --port 3002',
			cwd: '/var/www/fastuser/data/www/staging.infissi.omoxsoft.com.ua',
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production',
				PORT: 3002,
			},
			// Логирование
			log_file: '/var/www/fastuser/data/logs/staging-combined.log',
			out_file: '/var/www/fastuser/data/logs/staging-out.log',
			error_file: '/var/www/fastuser/data/logs/staging-error.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

			// Мониторинг
			min_uptime: '10s',
			max_restarts: 10,

			// Graceful shutdown
			kill_timeout: 5000,
			listen_timeout: 3000,

			// Advanced features
			merge_logs: true,
			time: true,
		},
	],
}
