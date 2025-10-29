import { Server } from 'http';
import app from './app';
import config from './config';

async function bootstrap() {
  // 🧠 Hold the server instance for later access (used in cleanup)
  let server: Server;

  try {
    /**
     * 🚀 Start Express Server
     * The app listens on the configured port.
     * Once started, logs the running URL to the console.
     */
    server = app.listen(config.port, () => {
      console.log(`🚀 Server is running on http://localhost:${config.port}`);
    });

    /**
     * 🧹 Graceful Shutdown Handler
     * Ensures all pending connections are closed properly
     * before the process exits.
     */
    const exitHandler = () => {
      if (server) {
        console.log('🛑 Closing server gracefully...');
        server.close(() => {
          console.log('✅ Server closed successfully.');
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    /**
     * ⚠️ Handle Unhandled Promise Rejections
     * Prevents the app from crashing silently when a promise is rejected
     * but not caught anywhere in the code.
     */
    process.on('unhandledRejection', (error) => {
      console.error('❌ Unhandled Rejection detected! Shutting down...');
      console.error(error);
      if (server) {
        server.close(() => process.exit(1));
      } else {
        process.exit(1);
      }
    });

    /**
     * 🧨 Handle Uncaught Exceptions
     * Catches unexpected errors that are not caught anywhere in the code.
     */
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception detected! Shutting down...');
      console.error(error);
      exitHandler();
    });

    /**
     * 🔌 Handle SIGTERM (e.g., from Docker or process managers)
     * Useful in containerized environments for graceful shutdowns.
     */
    process.on('SIGTERM', () => {
      console.log('📴 SIGTERM received. Closing server...');
      if (server) {
        server.close(() => console.log('✅ Process terminated cleanly.'));
      }
    });

  } catch (error) {
    console.error('❌ Error during server startup:', error);
    process.exit(1);
  }
}

// Initialize the application
bootstrap();
