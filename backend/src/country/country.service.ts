import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateCountryDto from './dto/createcountry.dto';
import UpdateCountryDto from './dto/updatecountry.dto';

@Injectable()
export class CountryService {
  constructor(private readonly prisma: PrismaService) {}


     async create(data:CreateCountryDto){
            if (!data.countryCode || !data.countryName) {
                 throw new Error('Missing required country fields');
            }
            return this.prisma.country.create({
                 data: {
                        regions: data.regions,
                        countryCode: data.countryCode,
                        countryName: data.countryName,
                        currencyId: Number(data.currencyId),
                 },
            });
     }
     
        async findAll() {

  return this.prisma.country.findMany({
    include: {
      currency: true, // ✅ include currency object
    },
  });
}


        async findOne(id: number) {
            return this.prisma.country.findUnique({
                where: { id },
                include: {
                    currency: true, // Include currency details
                },

            });
        }

        async update(id: number, data: UpdateCountryDto) {
  // Convert currencyId to number if present
  const { currencyId, ...rest } = data;
  return this.prisma.country.update({
    where: { id },
    data: {
      ...rest,
      currencyId: currencyId !== undefined ? Number(currencyId) : undefined,
    },
  });
}

        async remove(id: number) {
  // Delete all address book entries linked to this country
  await this.prisma.addressBook.deleteMany({ where: { countryId: id } });
  // Delete all ports linked to this country
  await this.prisma.ports.deleteMany({ where: { countryId: id } });
  // Now delete the country
  return this.prisma.country.delete({ where: { id } });
}
}

