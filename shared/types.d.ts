type Dock = {
  id: number,
  name: string,
}

type Trip = {
  id: number,
  startDockId: Dock.id,
  endDockId: Dock.id,
  startedAt: DateTime,
  endedAt: DateTime,
}
