function Validation(values) {
  let error = {};
  const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;

  if (values.username === "") {
    error.username = "Username shouldn't be empty";
  } else {
    error.username = "";
  }
  if (values.password === "") {
    error.password = "Password shouldn't be empty";
  } else if (!password_pattern.test(values.password)) {
    error.password = [
      "Password must contain at least:",
      "- 8 characters (upper & lower case)",
      "- 1 number",
    ];
  } else {
    error.password = "";
  }
  if (values.confirmPassword === "") {
    error.confirmPassword = "Confirm password shouldn't be empty";
  } else if (values.confirmPassword !== values.password) {
    error.confirmPassword = "Passwords do not match!";
  } else {
    error.confirmPassword = "";
  }
  return error;
}
export default Validation;
