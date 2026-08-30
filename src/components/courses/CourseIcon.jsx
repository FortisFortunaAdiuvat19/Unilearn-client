import {
  CATEGORY_ICONS, CATEGORY_COLORS, DEFAULT_CATEGORY_ICON, DEFAULT_CATEGORY_COLOR,
} from "@/lib/courseCategories";

const SIZES = {
  sm: { box: "w-10 h-10", icon: "w-5 h-5" },
  md: { box: "w-14 h-14", icon: "w-7 h-7" },
  lg: { box: "w-20 h-20", icon: "w-9 h-9" },
};

export default function CourseIcon({ category, imageUrl, alt = "", size = "md", className = "" }) {
  const { box, icon } = SIZES[size] || SIZES.md;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`${box} rounded-sm object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  const Icon = CATEGORY_ICONS[category] || DEFAULT_CATEGORY_ICON;
  const colorClass = CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR;

  return (
    <div className={`${box} rounded-sm flex items-center justify-center flex-shrink-0 ${colorClass} ${className}`}>
      <Icon className={icon} />
    </div>
  );
}
