## 图片文件大小的计算

- **矢量图**：因为是无损缩放，和图片尺寸无关。


- **光栅图** ：
  - 每个像素包含4个通道（R、G、B、A）；
  - 每个通道分配 256 个值（色阶），也就是每个通道 8 位（2^8 = 256），所以*每个像素需要 4 个字节*（4个通道 * 8 位 = 32 位 = 4 个字节）；
  - 对于一个 100 x 100 像素的图像，一共有 10000 个像素；
  - 10000 个像素 x 4 个字节 = 40000 个字节；
  - 40000 个字节 / 1024 = 39KB。

| 尺寸          | 像素     | 文件大小   |
| ----------- | ------ | ------ |
| 100 x 100   | 10000  | 39KB   |
| 200 x 200   | 40000  | 156KB  |
| 300 x 300   | 90000  | 351KB  |
| 500 x 500   | 250000 | 977KB  |
| 1000 x 1000 | 640000 | 2500KB |

## JPEG 的压缩模式

### JPEG 主流压缩模式

- baseline 基线
- progressive 渐进式 （PJPEG）
- lossless 无损

加载方式上的区别：

**Baseline JPEG**

![https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/automating-image-optimization/images/Modern-Image6.jpg](baseline Jpeg 加载过程)

**Progressive JPEG**

![https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/automating-image-optimization/images/Modern-Image7.jpg](progressive Jpeg 加载过程)

### 总结

- PJPEG 优点：
  - 加载过程更友好，给用户的感觉加载更快；
  - 压缩率更高，可以减小 2 - 10% 的带宽。
- PJPEG 缺点：
  - 解码效率低，至多要慢上 3 倍，所以在移动设备上也更耗电；
  - 对于小图片来说，有可能文件尺寸会更大。

## 如何衡量图片压缩的质量

两个工具：

- SSIM（structural similarity）：
- Butteraugli:  这个难读的一匹的词是由 Google 开发的一个项目，用于评估图片压缩时画质降低到用户能察觉的临界点。和 SSIM 反映图片之间差别的累积不同，Butteraugli 关注的是最差的那部分。

## 主流的图片压缩

### MozJPEG

MozJPEG 比较适合压缩用于在 web 端展示并对质量要求较高的图片。

### Guetzli

Google 出品的 压缩工具。对比其它压缩工具，Guetzli 可以用小 20 - 30% 的文件体积达到相同的 Butteraugli 分数（事实上并不总是如此，有人专门做过[对比](https://cloudinary.com/blog/a_closer_look_at_guetzli)）。另一个特点是又慢又耗内存，每百万像素的处理需要 1分钟 + 200MB 的内存，所以建议 Guetzli 只用来压缩高质量的图片（比如没有压缩过的照片、PNG 或者 100% 质量的 JPEG）。

### WebP

Google 推出的图片格式。

#### 有损压缩

- 比 JPEG 小 25% - 34%；
- 低画质（0 - 50）场景下，对比 JPEG 优势巨大；
- 中等质量（-m 4 -q 75）可以是权衡速度和尺寸的甜点；
- 高画质（80 - 99），优势缩小；
- 综上，建议在速度优先的场景使用。

#### 无损压缩

- 无损 WebP 比 PNG 小 26%；
- 加载时间比 PNG 降低 3%；
- 更适合用来做图片归档。

#### 透明度

- 支持 8 位的无损透明通道，只比 PNG 多 22% 的bytes；
- 同样支持有损的 RGB 透明；

#### 元数据

支持 EXIF 和 XMP 元数据。















