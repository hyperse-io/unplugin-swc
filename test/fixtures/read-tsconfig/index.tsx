function sealed(constructor: Function) {}

@sealed
export class BugReport {}

// @ts-ignore
export const App = () => <div>hi</div>;
