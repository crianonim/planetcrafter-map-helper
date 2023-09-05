"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Point = [number, number];

type MarkerType = "room" | "custom" | "ore";
type Marker = {
  point: Point;
  type: MarkerType;
  description: string;
};

function pointToString(point: Point): string {
  return point[0] + ":" + point[1];
}

function removeMarker(markers: Array<Marker>, toRemove: Marker): Array<Marker> {
  return markers.filter(
    (m) => pointToString(m.point) !== pointToString(toRemove.point)
  );
}
function stringToMarkerType(s: string): MarkerType {
  switch (s) {
    case "custom":
      return "custom";
    case "ore":
      return "ore";
    default:
      return "room";
  }
}

const startingMarkers: Array<Marker> = JSON.parse(
  window.localStorage.getItem("markers") || "[]"
);
export default function Home() {
  const [selectedMarker, setSelectedMarker] = useState<null | Marker>(null);
  const [selectedPoint, setSelectedPoint] = useState<null | Point>(null);
  const [hoverPoint, setHoverPoint] = useState<null | Point>(null);
  const [markerType, setMarkerType] = useState<MarkerType>("room");
  const [description, setDescription] = useState("");
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
    <div className="flex">
      <svg
        className="border border-black h-screen"
        viewBox={"0 0 " + maxDimensionX + " " + maxDimensionY}
        onClick={(e) => {
          const pt = e.currentTarget.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const cursorpt = pt.matrixTransform(
            e.currentTarget.getScreenCTM()?.inverse()
          );
          setSelectedPoint([
            Math.round(maxY - cursorpt.y),
            Math.round(maxX - cursorpt.x),
          ]);
        }}
        onMouseMove={(e) => {
          const pt = e.currentTarget.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const cursorpt = pt.matrixTransform(
            e.currentTarget.getScreenCTM()?.inverse()
          );
          setHoverPoint([
            Math.round(maxY - cursorpt.y),
            Math.round(maxX - cursorpt.x),
          ]);
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
      <div className="flex flex-col gap-1">
        <div className="border border-black">
          {hoverPoint ? pointToString(hoverPoint) : "n/a"}
        </div>
        <div className="border border-black">
          {selectedPoint ? pointToString(selectedPoint) : "n/a"}
        </div>
        {selectedMarker && (
          <div>
            <div className="border border-slate-500 w-[200px]">
              <div className="flex justify-between">
                <div>
                  {selectedMarker.type} {pointToString(selectedMarker.point)}
                </div>
                <button
                  className="px-1 border border-current"
                  onClick={() => {
                    const ms = removeMarker(markers, selectedMarker);
                    setMarkers(ms);
                    setSelectedMarker(null);
                  }}
                >
                  x
                </button>
              </div>
              <div>{selectedMarker.description}</div>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <select
            className="p-1 border border-black"
            name="type"
            onChange={(e) => {
              setMarkerType(stringToMarkerType(e.target.value));
            }}
          >
            <option>room</option>
            <option>ore</option>
            <option>custom</option>
          </select>
          <input
            className="p-1 border border-black"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={() => {
              if (selectedPoint)
                setMarkers((m) => [
                  ...m,
                  { type: markerType, point: selectedPoint, description },
                ]);
            }}
            className="p-1 border border-black disabled:opacity-50"
            disabled={!selectedPoint}
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
}
