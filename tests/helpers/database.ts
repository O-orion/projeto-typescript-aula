import { appDataSource } from "../../src/database/appDataSource";

export async function clearDatabase() {
  const entities = appDataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = appDataSource.getRepository(entity.name);
    await repository.clear();
  }
}
