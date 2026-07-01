import RoleUsers from "./EachUserCompoents/RoleUsers";

const PropenuUser = ({ role = "user" }) => {
  return <RoleUsers role={role} />;
};

export default PropenuUser;
