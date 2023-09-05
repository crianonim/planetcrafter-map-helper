"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Point = [number, number];

type MarkerType = "room" | "custom" | "ore";
type Marker = {
  point: Point;
  type: MarkerType;
  description: string;
};

// const startingMarkers: Array<Marker> = [
//   { point: [12, 123], type: "room", description: "" },
//   { point: [-123, 233], type: "room", description: "" },
//   { point: [450, -678], type: "ore", description: "" },
//   { point: [-227, -3], type: "custom", description: "" },
// ];

function pointToString(point: Point): string {
  return point[0] + ":" + point[1];
}

function removeMarker(markers: Array<Marker>, toRemove: Marker): Array<Marker> {
  return markers.filter(
    (m) => pointToString(m.point) !== pointToString(toRemove.point)
  );
}

const startingMarkers: Array<Marker> = JSON.parse(
  window.localStorage.getItem("markers") || "[]"
);
export default function Home() {
  const [selectedMarker, setSelectedMarker] = useState<null | Marker>(null);
  const [selectedPoint, setSelectedPoint] = useState<null | Point>(null);
  const [markers, setMarkers] = useState(startingMarkers);
  useEffect(() => {
    localStorage.setItem("markers", JSON.stringify(markers));
    console.log("Saving markers", markers);
  }, [markers]);

  const [minY, maxY, minX, maxX] = useMemo(() => {
    const minY =
      -50 +
      markers
        .map((x) => x.point[0])
        .reduce((prev, curr) => Math.min(prev, curr));

    const maxY =
      50 +
      markers
        .map((x) => x.point[0])
        .reduce((prev, curr) => Math.max(prev, curr));

    const minX =
      -50 +
      markers
        .map((x) => x.point[1])
        .reduce((prev, curr) => Math.min(prev, curr));

    const maxX =
      50 +
      markers
        .map((x) => x.point[1])
        .reduce((prev, curr) => Math.max(prev, curr));
    console.log(markers, minY, maxY, minX, maxX);
    return [minY, maxY, minX, maxX];
  }, [markers]);

  const maxDimensionX = maxX - minX;
  const maxDimensionY = maxY - minY;

  function drawMarker(m: Marker) {
    const p = m.point;
    const color =
      m.type === "room" ? "blue" : m.type === "ore" ? "red" : "green";
    return (
      <circle
        className="cursor-pointer"
        r="10"
        cx={maxX - p[1]}
        cy={maxY - p[0]}
        key={pointToString(p)}
        onMouseEnter={() => setSelectedMarker(m)}
        stroke={color}
        fill={color}
      />
    );
  }
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const x: number = parseInt(f.get("x")?.toString() || "");
    const y: number = parseInt(f.get("y")?.toString() || "");
    const type = (f.get("type")?.toString() || "") as MarkerType;
    const description = f.get("description")?.toString() || "";
    const newMarker: Marker = { point: [y, x], type, description };
    console.log({ newMarker });
    setMarkers((m) => [...m, newMarker]);
  }
  return (
    <div className="flex flex-col">
      <div>Mapa</div>
      <div className="flex">
        <svg
          className="border border-black w-[40%]"
          viewBox={"0 0 " + maxDimensionX + " " + maxDimensionY}
          onClick={(e) => {
            const pt = e.currentTarget.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const cursorpt = pt.matrixTransform(
              e.currentTarget.getScreenCTM()?.inverse()
            );
            setSelectedPoint([maxY - cursorpt.y, maxX - cursorpt.x]);
          }}
        >
          <line
            x1={maxX - 40}
            x2={maxX + 40}
            y1={maxY}
            y2={maxY}
            stroke="black"
          />
          <line
            y1={maxY - 40}
            y2={maxY + 40}
            x1={maxX}
            x2={maxX}
            stroke="black"
          />
          {markers.map(drawMarker)}
          {selectedMarker && (
            <circle
              r="40"
              cx={maxX - selectedMarker.point[1]}
              cy={maxY - selectedMarker.point[0]}
              fill="none"
              stroke="black"
            />
          )}
          {selectedPoint && (
            <circle
              r="20"
              cx={maxX - selectedPoint[1]}
              cy={maxY - selectedPoint[0]}
            />
          )}
          {selectedMarker && selectedPoint && (
            <line
              x1={maxX - selectedMarker.point[1]}
              y1={maxY - selectedMarker.point[0]}
              x2={maxX - selectedPoint[1]}
              y2={maxY - selectedPoint[0]}
              stroke="black"
            />
          )}
        </svg>
        {selectedMarker && (
          <div>
            <div className="border border-slate-500 w-[200px]">
              <div>{pointToString(selectedMarker.point)}</div>
              <div>{selectedMarker.type}</div>
              <div>{selectedMarker.description}</div>
              <button
                onClick={() => {
                  const ms = removeMarker(markers, selectedMarker);
                  setMarkers(ms);
                  setSelectedMarker(null);
                }}
              >
                remove
              </button>
            </div>
          </div>
        )}

        <div>
          <form onSubmit={handleSubmit}>
            <fieldset className="flex flex-col">
              <input type="number" name="y" id="y" />
              <input type="number" name="x" id="x" />
              <input name="description" />
              <select name="type">
                <option>room</option>
                <option>ore</option>
                <option>custom</option>
              </select>
              <button>add</button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}
