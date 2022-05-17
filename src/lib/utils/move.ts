/* eslint-disable @typescript-eslint/no-explicit-any */

/** Move an array element from one position to another */
export function move(arr: any[] | readonly any[], oldIndex: number, newIndex: number): any[] {
  const newArr = [...arr];

  if (newIndex >= newArr.length) {
    let k = newIndex - newArr.length + 1;
    while (k--) {
      newArr.push(undefined);
    }
  }
  newArr.splice(newIndex, 0, newArr.splice(oldIndex, 1)[0]);
  return newArr;
}
