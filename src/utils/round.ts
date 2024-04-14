function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100; 
}

export default round;