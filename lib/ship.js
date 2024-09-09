export const Ship = (length) => {
  function hit() {
    this.hits++;
  }

  function isSunk() {
    return this.hits >= this.length;
  }

  return {
    length,
    hits: 0,
    hit,
    isSunk,
  };
};
