// Minimal stub so pino's optional pretty printer can resolve during web bundling
type PrettyFactoryOptions = Record<string, unknown>

export const prettyFactory = (_opts?: PrettyFactoryOptions) => ({
  write: (_msg: string) => {},
  end: () => {},
  on: () => {},
})

export default { prettyFactory }
