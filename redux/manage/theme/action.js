export const ThemeChanger = (value) => async (dispatch) => {
	console.log('ThemeChanger', value);
	dispatch({
	  type: "ThemeChanger",
	  payload: value
	});
};
