import csv
from datetime import date, timedelta
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUT_FILE = ROOT / "shopping_trends_updated.csv"
OUTPUT_FILE = ROOT / "sample-datasets" / "shopping_trends_upload_ready.csv"

OUTPUT_COLUMNS = [
    "CustomerID",
    "Age",
    "Gender",
    "City",
    "Product",
    "Category",
    "Quantity",
    "Price",
    "PurchaseDate",
]


def quantity_for_row(row_number: int) -> int:
    return (row_number % 5) + 1


def purchase_date_for_row(row_number: int) -> str:
    start = date(2026, 1, 1)
    return (start + timedelta(days=row_number % 90)).isoformat()


def main() -> None:
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with INPUT_FILE.open(newline="", encoding="utf-8") as source, OUTPUT_FILE.open(
        "w", newline="", encoding="utf-8"
    ) as target:
        reader = csv.DictReader(source)
        writer = csv.DictWriter(target, fieldnames=OUTPUT_COLUMNS)
        writer.writeheader()

        for index, row in enumerate(reader):
            writer.writerow(
                {
                    "CustomerID": row["CustomerID"],
                    "Age": row["Age"],
                    "Gender": row["Gender"],
                    "City": row["Location"],
                    "Product": row["Product"],
                    "Category": row["Category"],
                    "Quantity": quantity_for_row(index),
                    "Price": row["Price"],
                    "PurchaseDate": purchase_date_for_row(index),
                }
            )

    print(f"Created {OUTPUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
