import { auth } from "../_lib/auth";

export const metadata = {
  title: "Guest area",
};

async function page() {
  const session = await auth();
  console.log(session);
  const firstName = session.user.name.split(" ").at(0);
  //and here we dont even need optional chaining in order to check if the user even exists
  //because we can only be on this page if there is actually an active session
  return (
    <h2 className="font-semibold text-2xl text-accent-400 mb-7">
      Welcome, {firstName}
    </h2>
  );
}

export default page;
