//src/pages/features/property/components/shared/userInDetails.jsx
import { getUserDetails } from "../../../../../features/user/userService";

export const getUserInDetails = async () => {
    const user = await getUserDetails();
    return user.data;
}

