import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

const CssTextField = styled(TextField)({
  "& .MuiOutlinedInput-root:not(.Mui-focused) fieldset": {
    borderColor: "initial",
  },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
    borderColor: "#512682",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "black",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "black",
  },
  "& .MuiInput-input": {
    color: "black",
  },
});

function UsernameInput({ value, setValue }) {
  function handleChange(event) {
    setValue(event.target.value);
  }

  return (
    <div>
      <CssTextField
        label="Username:"
        type="text"
        variant="outlined"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
export default UsernameInput;
