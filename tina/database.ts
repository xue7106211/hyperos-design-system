import { createLocalDatabase } from '@tinacms/datalayer';

// Local filesystem backend for development and self-hosted deployments.
// Production with Git sync requires gitProvider + databaseAdapter (see Tina self-hosting docs).
export default createLocalDatabase();
