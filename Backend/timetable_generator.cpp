#include <iostream>
#include <string>

int main() {
    // Read input to consume it, but ignore for dummy
    std::string input;
    std::getline(std::cin, input);

    // Output dummy JSON for 2 timetables
    std::cout << R"([
    {
        "batch": 1,
        "alt": 1,
        "data": [
            ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Database Systems"],
            ["Algorithms", "Operating Systems", "Computer Networks", "Database Systems", "Data Structures"],
            ["Operating Systems", "Computer Networks", "Database Systems", "Data Structures", "Algorithms"],
            ["Computer Networks", "Database Systems", "Data Structures", "Algorithms", "Operating Systems"],
            ["Database Systems", "Data Structures", "Algorithms", "Operating Systems", "Computer Networks"]
        ]
    },
    {
        "batch": 1,
        "alt": 2,
        "data": [
            ["Database Systems", "Data Structures", "Algorithms", "Operating Systems", "Computer Networks"],
            ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Database Systems"],
            ["Algorithms", "Operating Systems", "Computer Networks", "Database Systems", "Data Structures"],
            ["Operating Systems", "Computer Networks", "Database Systems", "Data Structures", "Algorithms"],
            ["Computer Networks", "Database Systems", "Data Structures", "Algorithms", "Operating Systems"]
        ]
    }
])" << std::endl;

    return 0;
}