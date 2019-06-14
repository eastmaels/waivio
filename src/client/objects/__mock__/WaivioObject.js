export const getFields = jest.fn();
const mock = jest.fn().mockImplementation(() => {
  return { getField: getFields };
});

export default mock;
