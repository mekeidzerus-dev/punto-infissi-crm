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
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production',
				PORT: 3000,
			},
			// Логирование
			log_file: '/var/www/fastuser/data/logs/production-combined.log',
			out_file: '/var/www/fastuser/data/logs/production-out.log',
			error_file: '/var/www/fastuser/data/logs/production-error.log',
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
