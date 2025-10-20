module.exports = {
	apps: [
		{
			name: 'punto-infissi-crm',
			script: 'npm',
			args: 'start',
			cwd: '/var/www/fastuser/data/www/infissi.omoxsoft.com.ua',
			instances: 'max', // Используем все CPU ядра
			exec_mode: 'cluster',
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production',
				PORT: 3000,
			},
			env_staging: {
				NODE_ENV: 'staging',
				PORT: 3002,
			},
			// Логирование
			log_file: '/var/www/fastuser/data/logs/punto-infissi-crm.log',
			out_file: '/var/www/fastuser/data/logs/punto-infissi-crm-out.log',
			error_file: '/var/www/fastuser/data/logs/punto-infissi-crm-error.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

			// Мониторинг
			min_uptime: '10s',
			max_restarts: 10,

			// Graceful shutdown
			kill_timeout: 5000,
			listen_timeout: 3000,

			// Health check
			health_check_grace_period: 3000,

			// Advanced features
			merge_logs: true,
			time: true,
		},
	],
}
