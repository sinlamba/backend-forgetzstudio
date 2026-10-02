
export type WithoutUndefinde<T extends Record<string, unknown>> = {
  [K in keyof T as undefined extends T[K] ? never : K]: Exclude<T[K], undefined>

}


export function pickDefined<T extends Record<string, unknown>>(values: T) : WithoutUndefinde<T> {

  return Object.fromEntries(
    Object.entries(values).filter((e): e is [string , NonNullable<unknown>] => e[1] !== undefined ),
  ) as WithoutUndefinde<T>

}