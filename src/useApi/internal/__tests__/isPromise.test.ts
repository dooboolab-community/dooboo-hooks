const errorPromise = new Promise((r, e) => setTimeout(e, 1500));
const promise = new Promise((r) =>
  setTimeout(() => {
    console.log('hi');
    r();
  }, 1500),
);

it('sample', async () => {
  try {
    await errorPromise;
  } catch (e) {
    console.log('catch : ' + e);
  }
});
