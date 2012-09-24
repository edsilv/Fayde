/// <reference path="../Runtime/Nullstone.js" />
/// CODE
/// <reference path="Enums.js"/>
/// <reference path="Surface.js"/>
/// <reference path="../../gl-matrix.js"/>
/// <reference path="../Runtime/gl-matrix-ex.js"/>

//#region _RenderContext
var _RenderContext = Nullstone.Create("_RenderContext", undefined, 1);

_RenderContext.Instance.Init = function (surface) {
    this.Surface = surface;
    this.CanvasContext = this.Surface._Ctx;
    this._Transforms = [];
};

Nullstone.AutoProperties(_RenderContext, [
    "CurrentTransform",
    "CanvasContext"
]);

_RenderContext.Instance.Clip = function (clip) {
    this._DrawClip(clip);
    this.CanvasContext.clip();
};
_RenderContext.Instance.IsPointInPath = function (p) {
    return this.CanvasContext.isPointInPath(p.X, p.Y);
};
_RenderContext.Instance.IsPointInClipPath = function (clip, p) {
    this._DrawClip(clip);
    return this.CanvasContext.isPointInPath(p.X, p.Y);
};
_RenderContext.Instance._DrawClip = function (clip) {
    if (clip instanceof Rect) {
        this.CanvasContext.beginPath();
        this.CanvasContext.rect(clip.X, clip.Y, clip.Width, clip.Height);
        DrawDebug("DrawClip (Rect): " + clip.toString());
    } else if (clip instanceof Geometry) {
        clip.Draw(this);
        DrawDebug("DrawClip (Geometry): " + clip.toString());
    } else if (clip instanceof RawPath) {
        clip.Draw(this);
        DrawDebug("DrawClip (RawPath): " + clip.toString());
    }
};

_RenderContext.Instance.PreTransform = function (matrix) {
    if (matrix instanceof Transform) {
        matrix = matrix.Value.raw;
    }

    var ct = this.CurrentTransform;
    mat3.multiply(matrix, ct, ct); //ct = ct * matrix
    this.CanvasContext.setTransform(ct[0], ct[1], ct[3], ct[4], ct[2], ct[5]);

    //Matrix.Multiply(ct, ct, matrix);
    //var els = ct._Elements;
    //this.CanvasContext.setTransform(els[0], els[1], els[3], els[4], els[2], els[5]);
};
_RenderContext.Instance.Transform = function (matrix) {
    if (matrix instanceof Transform) {
        matrix = matrix.Value.raw;
    }
    var ct = this.CurrentTransform;
    mat3.multiply(ct, matrix, ct); //ct = matrix * ct
    this.CanvasContext.setTransform(ct[0], ct[1], ct[3], ct[4], ct[2], ct[5]);

    //Matrix.Multiply(ct, matrix, ct);
    //var els = ct._Elements;
    //this.CanvasContext.setTransform(els[0], els[1], els[3], els[4], els[2], els[5]);
};
_RenderContext.Instance.Translate = function (x, y) {
    var ct = this.CurrentTransform;
    mat3.translate(x, y);
    this.CanvasContext.translate(x, y);
};

_RenderContext.Instance.Save = function () {
    this.CanvasContext.save();
    var ct = this.CurrentTransform;
    this._Transforms.push(ct);
    this.CurrentTransform = ct == null ? mat3.identity() : mat3.create(ct);
};
_RenderContext.Instance.Restore = function () {
    var curXform = this._Transforms.pop();
    this.CurrentTransform = curXform;
    this.CanvasContext.restore();
};

_RenderContext.Instance.Rect = function (rect) {
    var ctx = this.CanvasContext;
    ctx.beginPath();
    ctx.rect(rect.X, rect.Y, rect.Width, rect.Height);
    DrawDebug("Rect: " + rect.toString());
};
_RenderContext.Instance.Fill = function (brush, region) {
    /// <param name="brush" type="Brush"></param>
    var ctx = this.CanvasContext;
    brush.SetupBrush(ctx, region);
    ctx.fillStyle = brush.ToHtml5Object();
    ctx.fill();
    DrawDebug("Fill: [" + ctx.fillStyle.toString() + "]");
};
_RenderContext.Instance.FillRect = function (brush, rect) {
    /// <param name="brush" type="Brush"></param>
    /// <param name="rect" type="Rect"></param>
    var ctx = this.CanvasContext;
    brush.SetupBrush(ctx, rect);
    ctx.beginPath();
    ctx.rect(rect.X, rect.Y, rect.Width, rect.Height);
    ctx.fillStyle = brush.ToHtml5Object();
    ctx.fill();
    DrawDebug("FillRect: [" + ctx.fillStyle.toString() + "] " + rect.toString());
};
_RenderContext.Instance.StrokeAndFillRect = function (strokeBrush, thickness, strokeRect, fillBrush, fillRect) {
    var ctx = this.CanvasContext;
    strokeBrush.SetupBrush(ctx, strokeRect);
    fillBrush.SetupBrush(ctx, fillRect);
    ctx.beginPath();
    ctx.rect(fillRect.X, fillRect.Y, fillRect.Width, fillRect.Height);
    ctx.strokeStyle = strokeBrush.ToHtml5Object();
    ctx.stroke();
    ctx.fillStyle = fillBrush.ToHtml5Object();
    ctx.fill();
    DrawDebug("StrokeAndFillRect: [" + ctx.strokeStyle.toString() + "] [" + ctx.fillStyle.toString() + "] " + fillRect.toString());
};
_RenderContext.Instance.Stroke = function (stroke, thickness, region) {
    /// <param name="stroke" type="Brush"></param>
    var ctx = this.CanvasContext;
    stroke.SetupBrush(ctx, region);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = stroke.ToHtml5Object();
    ctx.stroke();
    DrawDebug("Stroke: [" + ctx.strokeStyle.toString() + "] -> " + ctx.lineWidth.toString());
};

_RenderContext.Instance.Clear = function (rect) {
    this.CanvasContext.clearRect(rect.X, rect.Y, rect.Width, rect.Height);
    DrawDebug("Clear: " + rect.toString());
};
_RenderContext.Instance.SetGlobalAlpha = function (alpha) {
    this.CanvasContext.globalAlpha = alpha;
};

_RenderContext.ToArray = function (args) {
    var arr = [];
    for (var i in args)
        arr.push(args[i]);
    return arr;
};

Nullstone.FinishCreate(_RenderContext);
//#endregion