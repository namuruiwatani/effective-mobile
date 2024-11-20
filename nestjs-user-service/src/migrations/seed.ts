import { DataSource } from "typeorm";
import { User } from "../users/user.entity";

const generateRandomUser = (): Partial<User> => ({
  firstName: "Name" + Math.floor(Math.random() * 100),
  lastName: "Surname" + Math.floor(Math.random() * 100),
  age: Math.floor(Math.random() * 100),
  gender: Math.random() > 0.5 ? "male" : "female",
  problems: Math.random() > 0.5,
});

async function seed() {
  const dataSource = new DataSource({
    type: "postgres",
    host: "postgres",
    port: 5432,
    username: "user",
    password: "password",
    database: "users_db",
    entities: [User],
    synchronize: false,
    migrations: [__dirname + "/migrations/*.ts"],
  });

  try {
    await dataSource.initialize();

    const userRepository = dataSource.getRepository(User);

    await dataSource.transaction(async (transactionalEntityManager) => {
      const usersToInsert: Partial<User>[] = [];

      for (let i = 0; i < 1000000; i++) {
        usersToInsert.push(generateRandomUser());

        if (usersToInsert.length === 10000) {
          await transactionalEntityManager.save(User, usersToInsert);
          usersToInsert.length = 0;
        }
      }

      if (usersToInsert.length > 0) {
        await transactionalEntityManager.save(User, usersToInsert);
      }
    });

    console.log("Seed completed");
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((err) => console.error(err));
