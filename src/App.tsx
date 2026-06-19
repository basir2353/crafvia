import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CompressImagePage } from './pages/CompressImagePage'
import { CompressJpgPage } from './pages/CompressJpgPage'
import { CompressPdfPage } from './pages/CompressPdfPage'
import { HeicToJpgPage } from './pages/HeicToJpgPage'
import { ImageResizerPage } from './pages/ImageResizerPage'
import { MergePdfPage } from './pages/MergePdfPage'
import { RemoveBackgroundPage } from './pages/RemoveBackgroundPage'
import {
  AiWriterPage,
  BlogOutlinePage,
  CoverLetterPage,
  EmailWriterPage,
  GrammarCheckPage,
  HeadlineGeneratorPage,
  KeywordExtractorPage,
  ParaphrasePage,
  PlagiarismCheckPage,
  ProductDescriptionPage,
  ReadabilityScorePage,
  ResumeBuilderPage,
  SocialCaptionPage,
  SummarizePage,
  ToneChangerPage,
  TranslateTextPage,
} from './pages/ai-writing/AiWritingToolPages'
import { JsonFormatterPage } from './pages/JsonFormatterPage'
import {
  ApiTesterPage,
  Base64EncodePage,
  ColorConverterPage,
  CronGeneratorPage,
  CssFormatterPage,
  CsvToJsonPage,
  DiffCheckerPage,
  HashGeneratorPage,
  HtmlEntityPage,
  HtmlFormatterPage,
  JsonGeneratorPage,
  JsonToCsvPage,
  JsFormatterPage,
  JwtDecoderPage,
  MarkdownPreviewPage,
  RegexTesterPage,
  SqlFormatterPage,
  TimestampConverterPage,
  UrlEncoderPage,
  UuidGeneratorPage,
  YamlValidatorPage,
} from './pages/developer-tools/DevToolPages'
import {
  AgeCalculatorPage,
  BmiCalculatorPage,
  CompoundInterestPage,
  DiscountCalculatorPage,
  GpaCalculatorPage,
  LoanCalculatorPage,
  PercentageCalculatorPage,
  TipCalculatorPage,
  UnitConverterPage,
} from './pages/calculators/CalcToolPages'
import {
  AngleConverterPage,
  AreaConverterPage,
  CurrencyConverterPage,
  DataConverterPage,
  EnergyConverterPage,
  LengthConverterPage,
  PressureConverterPage,
  SpeedConverterPage,
  TemperatureConverterPage,
  TimeConverterPage,
  VolumeConverterPage,
  WeightConverterPage,
} from './pages/converters/ConvertToolPages'
import {
  CompressAudioPage,
  CompressCssPage,
  CompressGifPage,
  CompressHtmlPage,
  CompressJsPage,
  CompressJsonPage,
  CompressSvgPage,
  CompressWebpPage,
  CompressXmlPage,
  CompressZipPage,
} from './pages/compressors/CompressToolPages'
import {
  BulkRenamePage,
  ClipboardManagerPage,
  CoinFlipPage,
  ColorPickerToolPage,
  CountdownTimerPage,
  DecisionMakerPage,
  DiceRollerPage,
  ExifViewerPage,
  FileHashPage,
  NotepadPage,
  PixelRulerPage,
  PomodoroTimerPage,
  RandomNumberPage,
  ScreenColorPage,
  StopwatchPage,
} from './pages/utilities/UtilToolPages'
import {
  DecryptTextPage,
  EncryptTextPage,
  IpLookupPage,
  PasswordStrengthPage,
  PgpKeygenPage,
  SecureDeletePage,
  SslCheckerPage,
  WhoisLookupPage,
} from './pages/security-tools/SecurityToolPages'
import { QrCodeGeneratorPage } from './pages/QrCodeGeneratorPage'
import {
  BarcodeGeneratorPage,
  ColorPalettePage,
  ImageGeneratorPage,
  LogoMakerPage,
  MemeGeneratorPage,
  NameGeneratorPage,
  PasswordGeneratorPage,
} from './pages/ai-generation/GenToolPages'
import {
  AddLineNumbersPage,
  BinaryConverterPage,
  CaseConverterPage,
  EmojiPickerPage,
  FancyTextPage,
  FindReplacePage,
  LoremIpsumPage,
  MorseCodePage,
  ReadingTimePage,
  RemoveDuplicatesPage,
  RemoveSpacesPage,
  ReverseTextPage,
  SortLinesPage,
  TextDiffPage,
  WordCounterPage,
} from './pages/text-tools/TextToolPages'
import {
  BacklinkCheckerPage,
  CanonicalCheckerPage,
  HeadingAnalyzerPage,
  KeywordDensityPage,
  MetaTagGeneratorPage,
  OpenGraphPreviewPage,
  PageSpeedTipsPage,
  RobotsTxtPage,
  SchemaMarkupPage,
  SitemapGeneratorPage,
  SlugGeneratorPage,
} from './pages/seo-tools/SeoToolPages'
import { TextToSpeechPage } from './pages/TextToSpeechPage'
import { VideoToMp3Page } from './pages/VideoToMp3Page'
import { CompressPngPage } from './pages/CompressPngPage'
import { CategoryPage } from './pages/CategoryPage'
import {
  BlurImagePage,
  CropImagePage,
  FaviconGeneratorPage,
  ImageConverterPage,
  ImageToPdfPage,
  JpgToPngPage,
  PhotoEffectsPage,
  PngToJpgPage,
  RotateImagePage,
  SharpenImagePage,
  WatermarkImagePage,
  WebpToJpgPage,
} from './pages/image-tools/ImageToolPages'
import {
  DeletePdfPagesPage,
  ExtractPdfTextPage,
  HtmlToPdfPage,
  PdfMetadataPage,
  PdfToImagePage,
  PdfToWordPage,
  ProtectPdfPage,
  ReorderPdfPage,
  RotatePdfPage,
  SplitPdfPage,
  UnlockPdfPage,
  WordToPdfPage,
} from './pages/pdf-tools/PdfToolPages'
import {
  ChangeSpeedPage,
  ConvertMp3Page,
  FadeAudioPage,
  MergeAudioPage,
  NormalizeAudioPage,
  RemoveNoisePage,
  ReverseAudioPage,
  SpeechToTextPage,
  TrimAudioPage,
} from './pages/audio-tools/AudioToolPages'
import {
  AddSubtitlesPage,
  CompressVideoPage,
  ConvertMp4Page,
  MergeVideosPage,
  MuteVideoPage,
  ResizeVideoPage,
  RotateVideoPage,
  ScreenRecorderPage,
  TrimVideoPage,
  VideoToGifPage,
  WebcamRecorderPage,
} from './pages/video-tools/VideoToolPages'
import { ContentPage } from './pages/ContentPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminGuard } from './pages/admin/AdminGuard'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminSiteConfigPage } from './pages/admin/AdminSiteConfigPage'
import { AdminContentPage } from './pages/admin/AdminContentPage'
import { AdminToolsPage } from './pages/admin/AdminToolsPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/pricing" element={<ContentPage />} />
        <Route path="/privacy" element={<ContentPage />} />
        <Route path="/terms" element={<ContentPage />} />
        <Route path="/about" element={<ContentPage />} />
        <Route path="/faq" element={<ContentPage />} />
        <Route path="/blog" element={<ContentPage />} />
        <Route path="/changelog" element={<ContentPage />} />
        <Route path="/tools/compress-image" element={<CompressImagePage />} />
        <Route path="/tools/compress-jpg" element={<CompressJpgPage />} />
        <Route path="/tools/compress-png" element={<CompressPngPage />} />
        <Route path="/tools/compress-pdf" element={<CompressPdfPage />} />
        <Route path="/tools/heic-to-jpg" element={<HeicToJpgPage />} />
        <Route path="/tools/remove-background" element={<RemoveBackgroundPage />} />
        <Route path="/tools/image-resizer" element={<ImageResizerPage />} />
        <Route path="/tools/image-converter" element={<ImageConverterPage />} />
        <Route path="/tools/crop-image" element={<CropImagePage />} />
        <Route path="/tools/rotate-image" element={<RotateImagePage />} />
        <Route path="/tools/webp-to-jpg" element={<WebpToJpgPage />} />
        <Route path="/tools/png-to-jpg" element={<PngToJpgPage />} />
        <Route path="/tools/jpg-to-png" element={<JpgToPngPage />} />
        <Route path="/tools/image-to-pdf" element={<ImageToPdfPage />} />
        <Route path="/tools/watermark-image" element={<WatermarkImagePage />} />
        <Route path="/tools/photo-effects" element={<PhotoEffectsPage />} />
        <Route path="/tools/favicon-generator" element={<FaviconGeneratorPage />} />
        <Route path="/tools/blur-image" element={<BlurImagePage />} />
        <Route path="/tools/sharpen-image" element={<SharpenImagePage />} />
        <Route path="/tools/merge-pdf" element={<MergePdfPage />} />
        <Route path="/tools/split-pdf" element={<SplitPdfPage />} />
        <Route path="/tools/pdf-to-image" element={<PdfToImagePage />} />
        <Route path="/tools/rotate-pdf" element={<RotatePdfPage />} />
        <Route path="/tools/protect-pdf" element={<ProtectPdfPage />} />
        <Route path="/tools/unlock-pdf" element={<UnlockPdfPage />} />
        <Route path="/tools/html-to-pdf" element={<HtmlToPdfPage />} />
        <Route path="/tools/pdf-to-word" element={<PdfToWordPage />} />
        <Route path="/tools/word-to-pdf" element={<WordToPdfPage />} />
        <Route path="/tools/extract-pdf-text" element={<ExtractPdfTextPage />} />
        <Route path="/tools/reorder-pdf" element={<ReorderPdfPage />} />
        <Route path="/tools/delete-pdf-pages" element={<DeletePdfPagesPage />} />
        <Route path="/tools/pdf-metadata" element={<PdfMetadataPage />} />
        <Route path="/tools/video-to-mp3" element={<VideoToMp3Page />} />
        <Route path="/tools/trim-video" element={<TrimVideoPage />} />
        <Route path="/tools/convert-mp4" element={<ConvertMp4Page />} />
        <Route path="/tools/compress-video" element={<CompressVideoPage />} />
        <Route path="/tools/video-to-gif" element={<VideoToGifPage />} />
        <Route path="/tools/merge-videos" element={<MergeVideosPage />} />
        <Route path="/tools/resize-video" element={<ResizeVideoPage />} />
        <Route path="/tools/rotate-video" element={<RotateVideoPage />} />
        <Route path="/tools/mute-video" element={<MuteVideoPage />} />
        <Route path="/tools/add-subtitles" element={<AddSubtitlesPage />} />
        <Route path="/tools/screen-recorder" element={<ScreenRecorderPage />} />
        <Route path="/tools/webcam-recorder" element={<WebcamRecorderPage />} />
        <Route path="/tools/trim-audio" element={<TrimAudioPage />} />
        <Route path="/tools/convert-mp3" element={<ConvertMp3Page />} />
        <Route path="/tools/normalize-audio" element={<NormalizeAudioPage />} />
        <Route path="/tools/merge-audio" element={<MergeAudioPage />} />
        <Route path="/tools/change-speed" element={<ChangeSpeedPage />} />
        <Route path="/tools/fade-audio" element={<FadeAudioPage />} />
        <Route path="/tools/reverse-audio" element={<ReverseAudioPage />} />
        <Route path="/tools/remove-noise" element={<RemoveNoisePage />} />
        <Route path="/tools/speech-to-text" element={<SpeechToTextPage />} />
        <Route path="/tools/text-to-speech" element={<TextToSpeechPage />} />
        <Route path="/tools/ai-writer" element={<AiWriterPage />} />
        <Route path="/tools/paraphrase" element={<ParaphrasePage />} />
        <Route path="/tools/summarize" element={<SummarizePage />} />
        <Route path="/tools/grammar-check" element={<GrammarCheckPage />} />
        <Route path="/tools/tone-changer" element={<ToneChangerPage />} />
        <Route path="/tools/headline-generator" element={<HeadlineGeneratorPage />} />
        <Route path="/tools/blog-outline" element={<BlogOutlinePage />} />
        <Route path="/tools/email-writer" element={<EmailWriterPage />} />
        <Route path="/tools/product-description" element={<ProductDescriptionPage />} />
        <Route path="/tools/social-caption" element={<SocialCaptionPage />} />
        <Route path="/tools/resume-builder" element={<ResumeBuilderPage />} />
        <Route path="/tools/cover-letter" element={<CoverLetterPage />} />
        <Route path="/tools/translate-text" element={<TranslateTextPage />} />
        <Route path="/tools/keyword-extractor" element={<KeywordExtractorPage />} />
        <Route path="/tools/readability-score" element={<ReadabilityScorePage />} />
        <Route path="/tools/plagiarism-check" element={<PlagiarismCheckPage />} />
        <Route path="/tools/json-formatter" element={<JsonFormatterPage />} />
        <Route path="/tools/base64-encode" element={<Base64EncodePage />} />
        <Route path="/tools/regex-tester" element={<RegexTesterPage />} />
        <Route path="/tools/uuid-generator" element={<UuidGeneratorPage />} />
        <Route path="/tools/hash-generator" element={<HashGeneratorPage />} />
        <Route path="/tools/url-encoder" element={<UrlEncoderPage />} />
        <Route path="/tools/html-formatter" element={<HtmlFormatterPage />} />
        <Route path="/tools/css-formatter" element={<CssFormatterPage />} />
        <Route path="/tools/js-formatter" element={<JsFormatterPage />} />
        <Route path="/tools/jwt-decoder" element={<JwtDecoderPage />} />
        <Route path="/tools/cron-generator" element={<CronGeneratorPage />} />
        <Route path="/tools/color-converter" element={<ColorConverterPage />} />
        <Route path="/tools/diff-checker" element={<DiffCheckerPage />} />
        <Route path="/tools/markdown-preview" element={<MarkdownPreviewPage />} />
        <Route path="/tools/sql-formatter" element={<SqlFormatterPage />} />
        <Route path="/tools/yaml-validator" element={<YamlValidatorPage />} />
        <Route path="/tools/api-tester" element={<ApiTesterPage />} />
        <Route path="/tools/lorem-json" element={<JsonGeneratorPage />} />
        <Route path="/tools/timestamp-converter" element={<TimestampConverterPage />} />
        <Route path="/tools/html-entity" element={<HtmlEntityPage />} />
        <Route path="/tools/csv-to-json" element={<CsvToJsonPage />} />
        <Route path="/tools/json-to-csv" element={<JsonToCsvPage />} />
        <Route path="/tools/word-counter" element={<WordCounterPage />} />
        <Route path="/tools/case-converter" element={<CaseConverterPage />} />
        <Route path="/tools/lorem-ipsum" element={<LoremIpsumPage />} />
        <Route path="/tools/remove-duplicates" element={<RemoveDuplicatesPage />} />
        <Route path="/tools/sort-lines" element={<SortLinesPage />} />
        <Route path="/tools/reverse-text" element={<ReverseTextPage />} />
        <Route path="/tools/find-replace" element={<FindReplacePage />} />
        <Route path="/tools/add-line-numbers" element={<AddLineNumbersPage />} />
        <Route path="/tools/remove-spaces" element={<RemoveSpacesPage />} />
        <Route path="/tools/text-diff" element={<TextDiffPage />} />
        <Route path="/tools/emoji-picker" element={<EmojiPickerPage />} />
        <Route path="/tools/fancy-text" element={<FancyTextPage />} />
        <Route path="/tools/morse-code" element={<MorseCodePage />} />
        <Route path="/tools/binary-converter" element={<BinaryConverterPage />} />
        <Route path="/tools/reading-time" element={<ReadingTimePage />} />
        <Route path="/tools/qr-code-generator" element={<QrCodeGeneratorPage />} />
        <Route path="/tools/password-generator" element={<PasswordGeneratorPage />} />
        <Route path="/tools/image-generator" element={<ImageGeneratorPage />} />
        <Route path="/tools/barcode-generator" element={<BarcodeGeneratorPage />} />
        <Route path="/tools/color-palette" element={<ColorPalettePage />} />
        <Route path="/tools/logo-maker" element={<LogoMakerPage />} />
        <Route path="/tools/meme-generator" element={<MemeGeneratorPage />} />
        <Route path="/tools/name-generator" element={<NameGeneratorPage />} />
        <Route path="/tools/meta-tag-generator" element={<MetaTagGeneratorPage />} />
        <Route path="/tools/sitemap-generator" element={<SitemapGeneratorPage />} />
        <Route path="/tools/robots-txt" element={<RobotsTxtPage />} />
        <Route path="/tools/open-graph-preview" element={<OpenGraphPreviewPage />} />
        <Route path="/tools/schema-markup" element={<SchemaMarkupPage />} />
        <Route path="/tools/keyword-density" element={<KeywordDensityPage />} />
        <Route path="/tools/slug-generator" element={<SlugGeneratorPage />} />
        <Route path="/tools/heading-analyzer" element={<HeadingAnalyzerPage />} />
        <Route path="/tools/canonical-checker" element={<CanonicalCheckerPage />} />
        <Route path="/tools/page-speed-tips" element={<PageSpeedTipsPage />} />
        <Route path="/tools/backlink-checker" element={<BacklinkCheckerPage />} />
        <Route path="/tools/percentage-calculator" element={<PercentageCalculatorPage />} />
        <Route path="/tools/bmi-calculator" element={<BmiCalculatorPage />} />
        <Route path="/tools/loan-calculator" element={<LoanCalculatorPage />} />
        <Route path="/tools/tip-calculator" element={<TipCalculatorPage />} />
        <Route path="/tools/age-calculator" element={<AgeCalculatorPage />} />
        <Route path="/tools/gpa-calculator" element={<GpaCalculatorPage />} />
        <Route path="/tools/discount-calculator" element={<DiscountCalculatorPage />} />
        <Route path="/tools/compound-interest" element={<CompoundInterestPage />} />
        <Route path="/tools/unit-converter" element={<UnitConverterPage />} />
        <Route path="/tools/length-converter" element={<LengthConverterPage />} />
        <Route path="/tools/weight-converter" element={<WeightConverterPage />} />
        <Route path="/tools/temperature-converter" element={<TemperatureConverterPage />} />
        <Route path="/tools/speed-converter" element={<SpeedConverterPage />} />
        <Route path="/tools/area-converter" element={<AreaConverterPage />} />
        <Route path="/tools/volume-converter" element={<VolumeConverterPage />} />
        <Route path="/tools/time-converter" element={<TimeConverterPage />} />
        <Route path="/tools/data-converter" element={<DataConverterPage />} />
        <Route path="/tools/angle-converter" element={<AngleConverterPage />} />
        <Route path="/tools/pressure-converter" element={<PressureConverterPage />} />
        <Route path="/tools/energy-converter" element={<EnergyConverterPage />} />
        <Route path="/tools/currency-converter" element={<CurrencyConverterPage />} />
        <Route path="/tools/compress-webp" element={<CompressWebpPage />} />
        <Route path="/tools/compress-gif" element={<CompressGifPage />} />
        <Route path="/tools/compress-svg" element={<CompressSvgPage />} />
        <Route path="/tools/compress-audio" element={<CompressAudioPage />} />
        <Route path="/tools/compress-zip" element={<CompressZipPage />} />
        <Route path="/tools/compress-html" element={<CompressHtmlPage />} />
        <Route path="/tools/compress-css" element={<CompressCssPage />} />
        <Route path="/tools/compress-js" element={<CompressJsPage />} />
        <Route path="/tools/compress-json" element={<CompressJsonPage />} />
        <Route path="/tools/compress-xml" element={<CompressXmlPage />} />
        <Route path="/tools/stopwatch" element={<StopwatchPage />} />
        <Route path="/tools/countdown-timer" element={<CountdownTimerPage />} />
        <Route path="/tools/pomodoro-timer" element={<PomodoroTimerPage />} />
        <Route path="/tools/random-number" element={<RandomNumberPage />} />
        <Route path="/tools/dice-roller" element={<DiceRollerPage />} />
        <Route path="/tools/coin-flip" element={<CoinFlipPage />} />
        <Route path="/tools/decision-maker" element={<DecisionMakerPage />} />
        <Route path="/tools/notepad" element={<NotepadPage />} />
        <Route path="/tools/clipboard-manager" element={<ClipboardManagerPage />} />
        <Route path="/tools/file-hash" element={<FileHashPage />} />
        <Route path="/tools/exif-viewer" element={<ExifViewerPage />} />
        <Route path="/tools/color-picker-tool" element={<ColorPickerToolPage />} />
        <Route path="/tools/screen-color" element={<ScreenColorPage />} />
        <Route path="/tools/pixel-ruler" element={<PixelRulerPage />} />
        <Route path="/tools/bulk-rename" element={<BulkRenamePage />} />
        <Route path="/tools/password-strength" element={<PasswordStrengthPage />} />
        <Route path="/tools/encrypt-text" element={<EncryptTextPage />} />
        <Route path="/tools/decrypt-text" element={<DecryptTextPage />} />
        <Route path="/tools/pgp-keygen" element={<PgpKeygenPage />} />
        <Route path="/tools/ssl-checker" element={<SslCheckerPage />} />
        <Route path="/tools/ip-lookup" element={<IpLookupPage />} />
        <Route path="/tools/whois-lookup" element={<WhoisLookupPage />} />
        <Route path="/tools/secure-delete" element={<SecureDeletePage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="site-config" element={<AdminSiteConfigPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="tools" element={<AdminToolsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
