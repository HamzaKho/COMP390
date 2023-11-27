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
    error.password = "Invalid username or password";
  } else {
    error.password = "";
  }
  return error;
}
export default Validation;
