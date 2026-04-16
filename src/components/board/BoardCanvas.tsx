import { useEffect, useMemo, useState } from "react";
import {
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
} from "react-konva";
import type {
  BoardImage,
  BoardText,
  DrawLine,
  SelectedElement,
} from "../../types/board";

type BoardCanvasProps = {
  stageRef: React.RefObject<any>;
  width: number;
  height: number;
  lines: DrawLine[];
  texts: BoardText[];
  images: BoardImage[];
  selectedElement: SelectedElement;
  onStartDrawing: (x: number, y: number) => void;
  onDraw: (x: number, y: number) => void;
  onStopDrawing: () => void;
  onUpdateTextPosition: (id: number, x: number, y: number) => void;
  onUpdateImagePosition: (id: number, x: number, y: number) => void;
  onSelectText: (id: number) => void;
  onSelectImage: (id: number) => void;
  onClearSelection: () => void;
};

function CanvasImage({
  image,
  isSelected,
  onUpdatePosition,
  onSelect,
}: {
  image: BoardImage;
  isSelected: boolean;
  onUpdatePosition: (id: number, x: number, y: number) => void;
  onSelect: (id: number) => void;
}) {
  const [htmlImage, setHtmlImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = image.src;
    img.onload = () => setHtmlImage(img);
  }, [image.src]);

  if (!htmlImage) return null;

  return (
    <>
      <KonvaImage
        image={htmlImage}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        draggable
        onClick={() => onSelect(image.id)}
        onTap={() => onSelect(image.id)}
        onDragEnd={(e) =>
          onUpdatePosition(image.id, e.target.x(), e.target.y())
        }
      />

      {isSelected && (
        <Rect
          x={image.x}
          y={image.y}
          width={image.width}
          height={image.height}
          stroke="#ec4899"
          strokeWidth={3}
          dash={[8, 6]}
          listening={false}
        />
      )}
    </>
  );
}

export default function BoardCanvas({
  stageRef,
  width,
  height,
  lines,
  texts,
  images,
  selectedElement,
  onStartDrawing,
  onDraw,
  onStopDrawing,
  onUpdateTextPosition,
  onUpdateImagePosition,
  onSelectText,
  onSelectImage,
  onClearSelection,
}: BoardCanvasProps) {
  const getPointerPosition = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    return stage.getPointerPosition();
  };

  const handleMouseDown = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();

    if (clickedOnEmpty) {
      onClearSelection();
    }

    const point = getPointerPosition();
    if (!point) return;

    onStartDrawing(point.x, point.y);
  };

  const handleMouseMove = () => {
    const point = getPointerPosition();
    if (!point) return;
    onDraw(point.x, point.y);
  };

  const renderedImages = useMemo(
    () =>
      images.map((item) => (
        <CanvasImage
          key={item.id}
          image={item}
          isSelected={
            selectedElement?.type === "image" && selectedElement.id === item.id
          }
          onUpdatePosition={onUpdateImagePosition}
          onSelect={onSelectImage}
        />
      )),
    [images, onUpdateImagePosition, onSelectImage, selectedElement]
  );

  return (
    <div className="overflow-auto rounded-[32px] border border-slate-200 bg-white shadow-inner">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={onStopDrawing}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={onStopDrawing}
        className="rounded-[32px]"
      >
        <Layer>
          <Rect x={0} y={0} width={width} height={height} fill="#ffffff" />

          {renderedImages}

          {lines.map((line, index) => (
            <Line
              key={index}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.tool === "eraser" ? 22 : 4}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}

          {texts.map((item) => {
            const isSelected =
              selectedElement?.type === "text" && selectedElement.id === item.id;

            return (
              <Text
                key={item.id}
                x={item.x}
                y={item.y}
                text={item.text}
                fontSize={24}
                fill={item.color}
                draggable
                onClick={() => onSelectText(item.id)}
                onTap={() => onSelectText(item.id)}
                onDragEnd={(e) =>
                  onUpdateTextPosition(item.id, e.target.x(), e.target.y())
                }
                stroke={isSelected ? "#ec4899" : undefined}
                strokeWidth={isSelected ? 0.6 : 0}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}